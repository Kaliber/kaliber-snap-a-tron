import { WebsocketProvider } from '/machinery/WebsocketProvider'
import { ClientConfigProvider } from '/machinery/ClientConfig'
import { SceneController } from '/machinery/SceneController'
import { EffectLayer } from './machinery/EffectLayer'
import { DefaultScene } from './scenes/DefaultScene'
import { SceneVideo } from './scenes/SceneVideo'
import { Picture } from './scenes/Picture'
import { Reboot } from './scenes/Reboot'
import { GenerateImage } from './scenes/GenerateImage'
import { PromptCheck } from './scenes/PromptCheck'
import { EventEmitter } from './machinery/EventEmitter'
import { useRenderOnMount } from '@kaliber/use-render-on-mount'


export default function App({ config }) {
  const mounted = useRenderOnMount()

  if (!mounted) return null

  // ? Scene's are currently mapped in order of array index.

  const scenes = [
    <Picture />,
    <DefaultScene />,
    <SceneVideo />,
    <PromptCheck />,
    <GenerateImage />,
    <Reboot />,
  ]

  return (
    <AppContext {...{ config }}>
      <div>
        <SceneController {...{ scenes }} />
      </div>
    </AppContext>
  )
}

function AppContext({ config, children }) {
  return (
    <ClientConfigProvider {...{ config }}>
      <WebsocketProvider websocket={config.websocket}>
        <EventEmitter>
          <EffectLayer>
            {children}
          </EffectLayer>
        </EventEmitter>
      </WebsocketProvider>
    </ClientConfigProvider>
  )
}
