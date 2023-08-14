set object = createobject("wscript.shell")
object.run "wsl.exe --cd ~/kaliber-snap-a-tron --exec /usr/bin/yarn start", 1
