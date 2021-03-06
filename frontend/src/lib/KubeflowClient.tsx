import React from 'react';
import { logger } from './Utils';

declare global {
  interface Window {
    // Provided by:
    // 1. https://github.com/kubeflow/kubeflow/tree/master/components/centraldashboard#client-side-library
    // 2. /frontend/server/server.ts -> KUBEFLOW_CLIENT_PLACEHOLDER
    centraldashboard: any;
  }
}

let namespace: string | undefined;
let registeredHandler: undefined | ((namespace: string) => void);
function onNamespaceChanged(handler: (namespace: string) => void) {
  registeredHandler = handler;
}

export function init(): void {
  try {
    // Init method will invoke the callback with the event handler instance
    // and a boolean indicating whether the page is iframed or not
    window.centraldashboard.CentralDashboardEventHandler.init((cdeh: any) => {
      // Binds a callback that gets invoked anytime the Dashboard's
      // namespace is changed
      cdeh.onNamespaceSelected = (newNamespace: string) => {
        namespace = newNamespace;
        if (registeredHandler) {
          registeredHandler(namespace);
        }
      };
    });
  } catch (err) {
    logger.error('Failed to initialize central dashboard client', err);
  }
}

const NamespaceContext = React.createContext<string | undefined>(undefined);
export const NamespaceContextConsumer = NamespaceContext.Consumer;
export class NamespaceContextProvider extends React.Component {
  state = {
    namespace,
  };
  componentDidMount() {
    onNamespaceChanged(ns => this.setState({ namespace: ns }));
  }
  render() {
    return <NamespaceContext.Provider value={this.state.namespace} {...this.props} />;
  }
}
