import type { FC, ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, MarkLineComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity, useHistory } from '../../hass';

echarts.use([LineChart, GridComponent, TooltipComponent, MarkLineComponent, SVGRenderer]);

interface PlotTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  precision?: number;
  points?: number;
  timeRange?: string;
  thresholds?: {
    warn?: { lt?: number; gt?: number };
    alarm?: { lt?: number; gt?: number };
  };
}

function evaluateStatus(value: number, t?: PlotTileProps['thresholds']): TileStatus {
  if (!t) return 'ok';
  if (t.alarm) {
    if (t.alarm.lt != null && value < t.alarm.lt) return 'alarm';
    if (t.alarm.gt != null && value > t.alarm.gt) return 'alarm';
  }
  if (t.warn) {
    if (t.warn.lt != null && value < t.warn.lt) return 'warn';
    if (t.warn.gt != null && value > t.warn.gt) return 'warn';
  }
  return 'ok';
}

const COLOR_BY_STATUS: Record<TileStatus, string> = {
  ok:    '#22c55e',
  info:  '#0ea5e9',
  warn:  '#f59e0b',
  alarm: '#f87171',
  stale: '#64748b',
  idle:  '#94a3b8',
};

// ECharts-backed plot. Interactive crosshair + value tooltip on hover.
export const PlotTile: FC<PlotTileProps> = ({
  entityId,
  label,
  icon,
  precision = 1,
  points = 60,
  timeRange = '60m',
  thresholds,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const entity = useEntity(entityId);
  const history = useHistory(entityId, points);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;

  // Init once on mount. Resize observer keeps the chart aligned to its container.
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current, null, { renderer: 'svg' });
    chartRef.current = chart;
    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(ref.current);
    return () => {
      ro.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  // Re-set options when data or formatting changes.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || history.length < 2) return;

    const cur = entity ? parseFloat(entity.state) : NaN;
    const unit = (entity?.attributes.unit_of_measurement as string | undefined) ?? '';
    const status: TileStatus = Number.isFinite(cur) ? evaluateStatus(cur, thresholds) : 'idle';
    const color = COLOR_BY_STATUS[status];

    chart.setOption({
      animation: true,
      animationDuration: 300,
      grid: { left: 38, right: 8, top: 10, bottom: 22 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(26,29,34,0.95)',
        borderColor: 'rgba(255,255,255,0.10)',
        borderWidth: 1,
        textStyle: { color: '#e2e8f0', fontFamily: 'Share Tech Mono', fontSize: 10 },
        padding: [4, 8],
        formatter: (params: { value: number; dataIndex: number }[]) => {
          const p = params[0];
          const tFromNow = history.length - 1 - p.dataIndex;
          return `<div style="color:#8a96ac;font-size:9px;letter-spacing:0.08em">T-${tFromNow}</div><div style="color:#e2e8f0;font-weight:700">${p.value.toFixed(precision)} <span style="color:#8a96ac;font-size:9px">${unit.toUpperCase()}</span></div>`;
        },
        axisPointer: {
          type: 'line',
          lineStyle: { color: 'rgba(255,255,255,0.25)', width: 1, type: 'solid' },
          label: { show: false },
        },
      },
      xAxis: {
        type: 'category',
        data: history.map((_, i) => i),
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.10)' } },
        axisLabel: { show: false },
        axisTick: { show: false },
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.10)' } },
        axisLabel: {
          color: '#8a96ac',
          fontFamily: 'Share Tech Mono',
          fontSize: 9,
          formatter: (v: number) => v.toFixed(precision),
        },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      },
      series: [
        {
          type: 'line',
          data: history,
          showSymbol: false,
          smooth: 0.2,
          lineStyle: { width: 1.6, color },
          areaStyle: { color: `${color}1f` },
        },
      ],
    });
  }, [history, entity, precision, thresholds]);

  if (!entity) {
    return (
      <BaseTile label={friendly} status="stale" icon={icon} pill="unavail">
        <div className="plot-tile">n/a</div>
      </BaseTile>
    );
  }

  const unit = (entity.attributes.unit_of_measurement as string | undefined) ?? '';
  const cur = parseFloat(entity.state);
  const status: TileStatus = Number.isFinite(cur) ? evaluateStatus(cur, thresholds) : 'idle';
  const display = Number.isFinite(cur) ? cur.toFixed(precision) : entity.state;

  return (
    <BaseTile label={friendly} status={status} icon={icon}>
      <div className="plot-tile">
        <div className="plot-tile__head">
          <span className="plot-tile__num">{display}</span>
          {unit && <span className="plot-tile__unit">{unit}</span>}
          <span className="plot-tile__range">{timeRange}</span>
        </div>
        <div ref={ref} className="plot-tile__chart" />
      </div>
    </BaseTile>
  );
};
