declare const __SERVER__: boolean
declare const __CLIENT__: boolean
declare const __DEV__: boolean
// React-like shims
declare type Props<P> = {[Name in keyof P]: P[Name]} & {
  children?:
    | (JSX.Element | string[] | string | false | number | null)
    | (JSX.Element | string[] | string | false | number | null)[]
}
declare type FC<P = {}> = {
  (props: Props<P>): JSX.Element | null
  displayName?: string
}
