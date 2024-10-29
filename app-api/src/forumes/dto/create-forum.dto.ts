export class CreateFormDto {
    readonly title: string;
    readonly description: string;
    readonly author_id: string;
    readonly likes: number;
    readonly created_at: Date;
    readonly comments: Comment[];
  }