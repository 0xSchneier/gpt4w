interface Props {}

export default function BlinkText(props: Props) {
  return (
    <div
      className={`mr-[55px] flex-none w-fit content typed-cursor typed-cursor-blink text-[14px]`}
    ></div>
  )
}
