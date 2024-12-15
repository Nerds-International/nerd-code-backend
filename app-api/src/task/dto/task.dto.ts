class TestCaseDto {

  input: string;

  expected_output: string;
}

export class CreateTaskDto {

  title: string;

  text: string;

  author: string;

  difficulty: string;

  time_limit: number;

  test_cases: TestCaseDto[];
}

export class UpdateTaskDto extends CreateTaskDto {}
