import {h} from 'preact'
import {Route, RouteProps} from 'react-router-dom'
import createAsyncComponent, {
  AsyncComponentGetter,
} from 'create-async-component'

export interface AsyncRouteType<P> extends FC<RouteProps> {
  load: AsyncComponentGetter<P>
}

export function asyncRoute<P>(
  component: AsyncComponentGetter<P>
): AsyncRouteType<P> {
  const Children = createAsyncComponent<P>(component)
  const AsyncRoute = (props: P) => (
    <Route {...props}>{h(Children as FC, {})}</Route>
  )

  AsyncRoute.load = Children.load
  return AsyncRoute
}
