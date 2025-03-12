// client/src/components/ErrorBoundary.js
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "20px",
            maxWidth: "800px",
            margin: "0 auto",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <h1 style={{ color: "#e31a16" }}>Something went wrong.</h1>
          <p>We're sorry, an error occurred while loading the application.</p>
          <details
            style={{
              whiteSpace: "pre-wrap",
              marginTop: "20px",
              padding: "10px",
              backgroundColor: "#f5f5f7",
              borderRadius: "5px",
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              Error Details
            </summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#e31a16",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
