import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  tileType: string;
  isEditing: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

// Per-tile error boundary. A misconfigured tile (bad entity, malformed
// thresholds, missing attribute) should NOT blank the whole Overview. We
// catch the throw, render a SCADA-styled "render error" placeholder, and
// surface a Select/Delete action when edit mode is on.
export class TileErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.warn(`[realm] Tile render failed (${this.props.tileType}):`, error, info.componentStack);
  }

  private reset = () => this.setState({ error: null });

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className={`tile tile--alarm tile-error${this.props.isEditing ? ' tile-error--editing' : ''}`}>
        <div className="tile__header">
          <span className="tile__label-group">
            <span className="tile__label">RENDER ERROR</span>
          </span>
          <span className="tile__pill">{this.props.tileType}</span>
        </div>
        <div className="tile__body">
          <div className="tile-error__msg">{error.message || 'Unknown error.'}</div>
          <div className="tile-error__actions">
            <button type="button" className="tile-error__btn" onClick={this.reset}>RETRY</button>
            {this.props.isEditing && this.props.onSelect && (
              <button type="button" className="tile-error__btn" onClick={this.props.onSelect}>EDIT PROPS</button>
            )}
            {this.props.isEditing && this.props.onDelete && (
              <button type="button" className="tile-error__btn tile-error__btn--danger" onClick={this.props.onDelete}>DELETE</button>
            )}
          </div>
        </div>
      </div>
    );
  }
}
