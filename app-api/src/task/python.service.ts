import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';

@Injectable()
export class PythonService {
  async executeCodeWithTests(functionCode: string, tests: { input: string; expected: string }[]): Promise<string> {
    // Формируем Python-код для проверки тестов
    const testRunner = `
${functionCode}

results = []
failed = False

test_cases = ${JSON.stringify(tests)}

for test in test_cases:
    input_data = eval(test['input'])
    expected_output = eval(test['expected'])
    try:
        actual_output = f(input_data)
        if actual_output != expected_output:
            results.append(f"Test failed: input={test['input']}, expected={test['expected']}, got={actual_output}")
            failed = True
    except Exception as e:
        results.append(f"Test crashed: input={test['input']}, error={str(e)}")
        failed = True

if failed:
    for r in results:
        print(r)
    exit(1)
else:
    print("All tests passed!")
`;

    return new Promise((resolve, reject) => {
      const process = spawn('python3', ['-c', testRunner]);

      let output = '';
      let error = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        error += data.toString();
      });

      process.on('close', (exitCode) => {
        if (exitCode === 0) {
          resolve(output.trim());
        } else {
          reject(new Error(error.trim() || output.trim()));
        }
      });
    });
  }
}
