#!/bin/bash

curl -X POST http://localhost:3000/tasks \
-H "Content-Type: application/json" \
-d '{
  "title": "Задача по алгоритму сортировки",
  "text": "Напишите функцию, которая сортирует массив чисел.",
  "author": "IlyaAnon1488",
  "difficulty": "medium",
  "time_limit": 120,
  "test_cases": [
    {
      "input": "[3, 1, 2]",
      "expected_output": "[1, 2, 3]"
    },
    {
      "input": "[5, 4, 6]",
      "expected_output": "[4, 5, 6]"
    }
  ]
}'
