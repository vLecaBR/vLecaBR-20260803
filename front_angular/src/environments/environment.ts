/**
 * Configuração de ambiente do frontend.
 * `apiUrl` aponta para a API .NET local (ver docker-compose / launchSettings: porta 5080).
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5080/api',
};
