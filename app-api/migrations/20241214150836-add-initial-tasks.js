module.exports = {
  async up(db) {
    await db.collection('tasks').insertMany([
      {
        _id: "605b4d68b4f3e2b8b8b8b8b8",
        title: "Задача по алгоритму сортировки",
        text: "Напишите функцию, которая сортирует массив чисел.",
        author: "IlyaAnon228",
        difficulty: "medium",
        created_at: new Date("2024-10-05T10:00:00Z"),
        time_limit: 123,
        likes: 123,
        dislikes: 123,
        input_type: 1,
        output_type: 1,
        test_cases: [
          {
            input: "[3, 1, 2]",
            expected_output: "[1, 2, 3]",
          },
          {
            input: "[5, 4, 6]",
            expected_output: "[4, 5, 6]",
          },
        ],
      },
      {
        _id: "605b4d68b4f3e2b8b8b8b8b9",
        title: "Задача по поиску максимального элемента",
        text: "Напишите функцию, которая находит максимальный элемент в массиве чисел.",
        author: "IlyaAnon228",
        difficulty: "easy",
        created_at: new Date("2024-10-06T12:00:00Z"),
        time_limit: 60,
        likes: 45,
        dislikes: 5,
        input_type: 1,
        output_type: 1,
        test_cases: [
          {
            input: "[1, 3, 2]",
            expected_output: "3",
          },
          {
            input: "[5, 4, 6]",
            expected_output: "6",
          },
        ],
      },
      // Добавьте оставшиеся задачи аналогично
    ]);
  },

  async down(db) {
    await db.collection('tasks').deleteMany({
      _id: { $in: ["605b4d68b4f3e2b8b8b8b8b8", "605b4d68b4f3e2b8b8b8b8b9"] }, // Укажите все _id из задачи
    });
  },
};
