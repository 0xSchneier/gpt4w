// https://highlightjs.org/download/

import md5 from 'md5'
import Highlight from 'react-highlight'

// import 'highlight.js/styles/base16/solarized-dark.css'
// import 'highlight.js/styles/monokai-sublime.css'
import 'highlight.js/styles/atom-one-dark.css'

interface Props {
  text: string
}

export function CodeSnippet(props: Props) {
  const { text } = props
  const lang = /`{3}([\w+]?)\n/.exec(text)

  if (lang) {
    const nodes = text.split('```').map((content, index) => {
      const isCode = index % 2 === 1
      if (isCode) {
        const codes = /(?:(\w+)[\r\n])?([\s\S]+)/.exec(content)
        return (
          <Highlight className={lang[1]} key={md5(content)}>
            {codes[2].replace(/^\n/, '')}
          </Highlight>
        )
      }
      const html = content.replace(
        /`(.+?)`/g,
        (_, words) =>
          `<code class="text-white hljs rounded-[4px] ${lang?.[1]}" style="color: #fff">${words}</code>`
      )
      return (
        <p
          className='leading-[28px]'
          key={md5(content)}
          dangerouslySetInnerHTML={{ __html: html }}
        ></p>
      )
    })
    return <div>{nodes}</div>
  }
  return <div style={{ whiteSpace: 'pre-line' }} >{ text }</div>
}

export default function PlainText(props: Props) {
  const { text } = props
  return (
    <div className={`mr-[55px] flex-none w-fit text-[14px]`}>
      <CodeSnippet text={text} />
    </div>
  )
}
