import { ID, databases, storage } from "@/appwrite";
import { getTodosGroupedByColumn } from "@/lib/getTodosGroupedByColumn";
import uploadImage from "@/lib/uploadImage";
import { create } from "zustand";

interface IBoardState {
  // Board State
  board: IBoard;
  getBoard: () => void;
  setBoardState: (board: IBoard) => void;

  // Search State
  searchString: string;
  setSearchString: (searchString: string) => void;

  // Modal States
  newTaskInput: string;
  newTaskType: TypedColumn;
  image: File | null;

  setNewTaskInput: (input: string) => void;
  setNewTaskType: (input: TypedColumn) => void;
  setImage: (image: File | null) => void;

  // Database State
  addTask: (todo: string, columnId: TypedColumn, image?: File | null) => void;
  updateTodoInDb: (todo: ITodo, columnId: TypedColumn) => void;
  deleteTask: (taskIndex: number, todo: ITodo, id: TypedColumn) => void;
}

export const useBoardStore = create<IBoardState>((set, get) => ({
  // Board State
  board: {
    columns: new Map<TypedColumn, Column>(),
  },
  getBoard: async () => {
    const board = await getTodosGroupedByColumn();
    set({ board });
  },
  setBoardState: (board) => set({ board }),

  // Search State
  searchString: "",
  setSearchString: (searchString) => set({ searchString }),

  // Modal State
  newTaskInput: "",
  setNewTaskInput: (input) => set({ newTaskInput: input }),

  newTaskType: "todo",
  setNewTaskType: (input) => set({ newTaskType: input }),

  image: null,
  setImage: (image: File | null) => set({ image }),

  // Database State
  addTask: async (todo: string, columnId: TypedColumn, image?: File | null) => {
    let file: IImage | undefined;

    if (image) {
      const fileUploaded = await uploadImage(image);
      if (fileUploaded) {
        file = {
          bucketId: fileUploaded.bucketId,
          fileId: fileUploaded.$id,
        };
      }
    }

    const { $id } = await databases.createDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      ID.unique(),
      {
        title: todo,
        status: columnId,
        // include image if it exists
        ...(file && { image: JSON.stringify(file) }),
      }
    );

    set({ newTaskInput: "" });

    set((state) => {
      const newTodo: ITodo = {
        $id,
        $createdAt: new Date().toISOString(),
        title: todo,
        status: columnId,
        ...(file && { image: file }),
      };

      const newColumns = new Map(state.board.columns);

      const column = newColumns.get(columnId);

      if (!column) {
        newColumns.set(columnId, {
          id: columnId,
          todos: [newTodo],
        });
      } else {
        newColumns.get(columnId)?.todos.push(newTodo);
      }

      return {
        board: {
          columns: newColumns,
        },
      };
    });
  },

  deleteTask: async (taskIndex, todo, id) => {
    const newColumns = new Map(get().board.columns);

    // delete todoId from newColumns
    newColumns.get(id)?.todos.splice(taskIndex, 1);

    set({ board: { columns: newColumns } });

    if (todo.image) {
      await storage.deleteFile(todo.image.bucketId, todo.image.fileId);
    }

    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id
    );
  },

  updateTodoInDb: async (todo, columnId) => {
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id,
      {
        title: todo.title,
        status: columnId,
      }
    );
  },
}));
