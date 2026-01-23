import { NgModule } from '@angular/core';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { environment } from '../../environments/environment';
const config: SocketIoConfig = {
  url: environment.apiUrl,
  options: {
    transports: ['websocket', 'polling'],
    autoConnect:true,
  },
};

@NgModule({
  imports: [SocketIoModule.forRoot(config)],
  exports: [SocketIoModule],
})
export class SocketModule {}
