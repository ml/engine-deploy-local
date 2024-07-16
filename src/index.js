import shell from 'shelljs';
import fs from 'fs';

// Check if .env file exists
if (!fs.existsSync('.env')) {
  // Copy the content of .env.example to .env
  shell.cp('.env.example', '.env');
}

shell.exec('npm run deploy'); // Run the deploy script with npm-run-all