module.exports = {
  async up(db, client) {
    const collections = await db.listCollections({ name: 'forums' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('forums', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['title', 'description', 'author_id', 'likes', 'created_at'],
            properties: {
              title: { bsonType: 'string', description: 'Title of the forum post' },
              description: { bsonType: 'string', description: 'Description of the forum post' },
              author_id: { bsonType: 'string', description: 'ID of the author' },
              likes: { bsonType: 'int', minimum: 0, description: 'Number of likes' },
              created_at: { bsonType: 'date', description: 'Creation date of the forum post' },
              comments: {
                bsonType: 'array',
                items: {
                  bsonType: 'object',
                  required: ['user_id', 'comment', 'created_at'],
                  properties: {
                    user_id: { bsonType: 'string', description: 'ID of the user who commented' },
                    comment: { bsonType: 'string', description: 'Content of the comment' },
                    created_at: { bsonType: 'date', description: 'Date when the comment was created' },
                  },
                },
                description: 'List of comments',
              },
            },
          },
        },
      });
    }
  },

  async down(db, client) {
    await db.collection('forums').drop();
  },
};
