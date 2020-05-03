import {StyleObjectArgument} from '@dash-ui/react'
// -ui variants
export type Variant<VariantNames extends string> =
  | false
  | 0
  | null
  | undefined
  | VariantNames
  | StyleObjectArgument<VariantNames>

export type Variants<T> =
  | Variant<Extract<keyof T, string>>
  | Variant<Extract<keyof T, string>>[]
