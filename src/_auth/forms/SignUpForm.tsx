import { Button } from "../../components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { SignupValidation } from "../../lib/validation";
import { z } from "zod";

const SignUpForm = () => {
  // Define form
  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  // Submit handler
  function onSubmit(values: z.infer<typeof SignupValidation>) {
    console.log(values);
  }

  return (
    <div className="container">
      <Form {...form}>
        <div className="form-wrapper">
          <img src="/assets/images/star-logo.png" alt="logo" className="logo" />
          <h2 className="title">Create New Account</h2>
          <p className="subtitle">
            To use Stargram enter your details
          </p>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="form-content"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="submit-button">Submit</Button>
          </form>
        </div>
      </Form>
    </div>
  );
};

export default SignUpForm;
