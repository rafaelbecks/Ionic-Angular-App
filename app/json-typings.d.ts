// modulo para lectura de archivo json local sin uso de http o httoclient
declare module "*.json" {
    const value: any;
    export default value;
 }