export type Variant<VariantNames extends string> =
  | false
  | 0
  | null
  | undefined
  | VariantNames
  | {[Name in VariantNames]: any}

export type Variants<T> =
  | Variant<Extract<keyof T, string>>
  | Variant<Extract<keyof T, string>>[]
