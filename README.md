node-modbus
=================
### A pure JS implemetation of [MODBUS][Modbus] protocol for [Node][].

#### Warning: This project is not ready for production use.

This project is created because of [TooTallNate][]'s [node-modbus-stack][] didn't meet my needs.
With node-modbus, users don't have to deal with connections and timeouts.

**Roadmap:**
* Currently only TCP slave is supported, master is on the way.
* Of course, RS-485 RTU support should be possible with [node-serialport][] and it'll be the 3rd step.
* There's no plans for supporting ASCII right now.

As the project evolves quickly, I can't have time for writing documentation, sorry.
test folder can give you some insights about how to use it for now.
When API and functionalities become stable, more tests and docs will be my priority.

[Modbus]: http://www.modbus.org
[Node]: http://nodejs.org
[node-modbus-stack]: https://github.com/TooTallNate/node-modbus-stack
[TooTallNate]: https://github.com/TooTallNate
[node-serialport]: https://github.com/voodootikigod/node-serialport