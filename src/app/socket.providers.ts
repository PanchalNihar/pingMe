import { importProvidersFrom } from '@angular/core';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

const config: SocketIoConfig = {
  url: 'http://localhost:5000',
  options: {},
};

export const socketProviders = [
  importProvidersFrom(SocketIoModule.forRoot(config)),
];
