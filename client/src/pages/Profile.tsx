import React from "react";
import { useForm } from "react-hook-form";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

type formValues = {
  firstName: string;
  lastName: string;
  email: string;
};

const Profile = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formValues>();

  const onSubmit = (data: formValues) => {
    console.log("Form data : ", data);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="First Name"
          type="text"
          {...register("firstName", { required: "First Name is required" })}
          error={errors.firstName}
        />
        <Input
          label="Last Name"
          type="text"
          {...register("lastName", { required: "Last Name is required" })}
          error={errors.lastName}
        />
        <Input
          label="Email"
          type="email"
          {...register("email", { required: "Email is required" })}
          error={errors.email}
        />
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
};

export default Profile;
