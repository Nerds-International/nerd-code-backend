import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';

@Injectable()
export class PythonService {
  async executeCode(code: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn('python3', ['-c', code]);

      let output = '';
      let error = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        error += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error(error.trim()));
        }
      });
    });
  }
}
