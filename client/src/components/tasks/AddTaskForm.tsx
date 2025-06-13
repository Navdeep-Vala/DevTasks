import React from "react";
import { useForm } from "react-hook-form";
import { status } from "../../types/Task";
import Input from "../ui/Input";

type TaskFormValues = {
  title: string;
  description: string;
  project: string;
  status: status;
  dueDate: string;
};

const AddTaskForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormValues>();

  const onSubmit = (data: TaskFormValues) => {
    console.log("Data: ", data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Title"
        type="text"
        {...register("title", { required: "Title is required" })}
        error={errors.title}
      />
      <Input
        label="Description"
        type="text"
        {...register("description", { required: "Description is required" })}
        error={errors.description}
      />
      <Input
        label="Project"
        type="text"
        {...register("project", { required: "Project is required" })}
        error={errors.project}
      />
    </form>
  );
};

export default AddTaskForm;
