import {h} from 'preact'
import {forwardRef} from 'preact/compat'
import useId from '@accessible/use-id'

export const Lock: FC<any> = forwardRef<any, any>(function SvgComponent(
  {title, width = '1em', height = '1em', ...props},
  ref
) {
  const id = useId()
  return (
    <svg
      width={width}
      height={height}
      viewBox='0 0 24 24'
      fill='none'
      ref={ref}
      aria-hidden={String(!title)}
      aria-labelledby={!title ? void 0 : id}
      {...props}
    >
      {title ? <title id={id}>{title}</title> : null}
      <rect width='24' height='24' fill='none' rx='0' ry='0' />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12 1C9.23858 1 7 3.23858 7 6V11C5.89543 11 5 11.8954 5 13V21C5 22.1046 5.89543 23 7 23H17C18.1046 23 19 22.1046 19 21V13C19 11.8954 18.1046 11 17 11V6C17 3.23858 14.7614 1 12 1ZM15.5 6V11H8.5V6C8.5 4.067 10.067 2.5 12 2.5C13.933 2.5 15.5 4.067 15.5 6ZM12 18C11.4477 18 11 18.4477 11 19V20C11 20.5523 11.4477 21 12 21C12.5523 21 13 20.5523 13 20V19C13 18.4477 12.5523 18 12 18Z'
        fill='currentColor'
      />
    </svg>
  )
})
