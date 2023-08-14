import '/reset.css'
import '/index.css'
import '/cssGlobal/colors.css'
import '/cssGlobal/sizes.css'
import '/cssGlobal/type.css'

import stylesheet from '@kaliber/build/lib/stylesheet'
import javascript from '@kaliber/build/lib/javascript'
import polyfill from '@kaliber/build/lib/polyfill'
import rollbar from '@kaliber/build/lib/rollbar'
import config from '@kaliber/config'
import App from '/App?universal'

Index.routes = {
  match(location) {
    const path = location.pathname
    if (path === '/') return { status: 200 }
    else return { status: 404, data: { notFound: true } }
  }
}

export default function Index({ location, data }) {
  return (
    <html lang='nl'>
      <head>
        <meta charSet='utf-8' />
        <title>@kaliber/build</title>
        <meta name='description' content='' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet" />
        {stylesheet}
        {rollbar({ accessToken: config.rollbar.post_client_item })}
        {polyfill(['default', 'es2015', 'es2016', 'es2017', 'es2018', 'es2019'])}
        {javascript}
      </head>
      <body>
        {data && data.notFound
          ? 'Not found'
          : <App config={config.client} />
        }
      </body>
    </html>
  )
}
