'use strict'
const pdf = require('./print')
const path = require('path');

const argv = require('minimist')(process.argv.slice(2));

const contractActivityId = argv.a || 773156;
if (!contractActivityId) {
	console.log('ERROR: Specify contractActivityId with the -a option')
	process.exit(-1);
}
const wizardFile = argv.x || 'C:\\inetpub\\wwwroot\\AuditorCIS_13\\SAMIS\\G3ME\\Config\\G3ME_Submission-Wizards.xml';
if (!wizardFile) {
	console.log('ERROR: Specify wizard.xml to use with the -x option')
	process.exit(-2);
}
const jsonLookUpFolder = `/inetpub/wwwroot/AuditorCIS_13/SAMIS/Common/Resources/json/`;

const output = argv.o || 'public/print.pdf'

pdf.createDoc(contractActivityId, wizardFile, jsonLookUpFolder, output).then(r =>
	console.log(JSON.stringify(r))
).catch(e => {
	console.log('ERROR:');
    console.log(e);
    process.exit(-3);
});
