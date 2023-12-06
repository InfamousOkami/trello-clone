interface IBoard {
  columns: Map<TypedColumn, Column>;
}

type TypedColumn = "todo" | "inprogress" | "done";

interface Column {
  id: TypedColumn;
  todos: ITodo[];
}

interface ITodo {
  $id: string;
  $createdAt: string;
  title: string;
  status: TypedColumn;
  image?: IImage;
}

interface IImage {
  bucketId: string;
  fileId: string;
}
