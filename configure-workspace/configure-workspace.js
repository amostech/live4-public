const axios = require('axios');
let organization = null;
let organizationName = 'live4conf';
let api_url = 'https://api.live4conf.com';
let interface_config_path = '/config/interface_config.js';
let config_path = '/config/config.js';
async function init() {
  initializeArgs();
  const organizationResponse = await retrieveOrganization()
    .catch(function (error) {
      console.log('There has been a problem with your fetch operation: ' + error.message);
    });
  if (organizationResponse && organizationResponse.data) {
    organization = organizationResponse.data;
    readAndConfigureInterfaceConfig(organization);
    readAndChangeConfigFile();
  } else {
    throw new Error('Error to retrieve the organization info')
  }
}
function initializeArgs() {
  const initialValue = {};
  const argsObj = process.argv.reduce((obj, currentValue) => {
    const splited = currentValue.split('=');
    if (Array.isArray(splited) && splited.length > 1) {
      return {
        ...obj,
        [splited[0]]: splited[1],
      };
    } else {
      return initialValue;
    }
  }, initialValue);
  if (argsObj['organization_name']) {
    organizationName = argsObj['organization_name'];
  }
  console.log('Organization Name => ', organizationName);
}
function retrieveOrganization() {
  return axios.get(api_url + '/organization?name=' + organizationName)
}
function readAndConfigureInterfaceConfig(organization) {
  var fs = require('fs')
  fs.readFile(interface_config_path, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    let result = data;
    if (organization.name) {
      result = result.replace(new RegExp('APP_NAME:(.*\n)', 'g'), 'APP_NAME: \'' + organization.name + '\',  \n');
      result = result.replace(new RegExp('NATIVE_APP_NAME:(.*\n)', 'g'), 'NATIVE_APP_NAME: \'' + organization.name +'\', \n');
    }
    if (organization.background_color) {
      result = result.replace(new RegExp('DEFAULT_BACKGROUND:(.*\n)', 'g'), 'DEFAULT_BACKGROUND: \'' + organization.background_color + '\',  \n');
    }
    if (organization.logo_url) {
      result = result.replace(new RegExp('DEFAULT_LOGO_URL:(.*\n)', 'g'), 'DEFAULT_LOGO_URL: \'' + organization.logo_url+ '\',  \n');
      result = result.replace(new RegExp('DEFAULT_WELCOME_PAGE_LOGO_URL:(.*\n)', 'g'), 'DEFAULT_WELCOME_PAGE_LOGO_URL: \''+ organization.logo_url + '\',  \n');
    }
    fs.writeFile(interface_config_path, result, 'utf8', function (err) {
      if (err) return console.log(err);
    });
  });
}
function readAndChangeConfigFile() {
  var fs = require('fs')
  fs.readFile(config_path, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    let result = data;
    result = result.replace(new RegExp('.*defaultLanguage: (.*\n)', 'g'), '    defaultLanguage: \'ptBR\',  \n');
    fs.writeFile(config_path, result, 'utf8', function (err) {
      if (err) return console.log(err);
    });
  });
}
init();