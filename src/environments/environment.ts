// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiCRM: 'http://crm.ccfnweb.com.mx/apicrm/public/api',
  apiWMS: 'http://crm.ccfnweb.com.mx/apiwms/public/api',
  // apiSAP: 'http://192.168.101.103:1500', 
  apiCCFN: 'http://apiccfn.ccfnweb.com.mx/api', 
  // apiCCFN: 'http://localhost:5004/api',
  apiSAP: 'http://192.168.0.10:8886',
  update: 'http://crm.ccfnweb.com.mx/update.xml' 
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
 