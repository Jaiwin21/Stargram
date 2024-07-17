import { Button } from "../../components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { SignupValidation } from "../../lib/validation";
import { z } from "zod";
import Loader from "../../components/shared/Loader";
import { useToast } from "../../components/ui/use-toast";
import { useCreateUserAccount, useSignInAccount } from "../../lib/react-query/queriesAndMutations";
import { useUserContext } from "../../context/AuthContext";


const SignUpForm = () => {

  const { toast } = useToast();
  const { checkAuthUser } = useUserContext();
  const navigate = useNavigate();
  const { mutateAsync: createUserAccount, isPending: isCreatingAccount} = useCreateUserAccount();
  const { mutateAsync: signInAccount } = useSignInAccount();

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
  async function onSubmit(values: z.infer<typeof SignupValidation>) {
     const newUser = await createUserAccount(values);
    
    if (!newUser) {
      return toast({
        title: "Sign up failed. Please try again.",
      })
    }
  
    const session = await signInAccount({
      email: values.email,
      password: values.password,
    })

    if (!session) {
      toast({ title: "Sign-in failed. Please try again.", });
     
    }

    const isLoggedIn = await checkAuthUser();


      if (isLoggedIn) {
        form.reset();
        
        navigate("/sign-in");
      } else {
        toast({ title: "Sign-up failed. Please try again.", })
        
      }
}

  return (
    // Sign-up form
<div className="container">
  <Form {...form}>
    <div className="form-wrapper">
      <div className="logo-wrapper">
        <img src="/assets/images/star-logo.png" alt="logo" className="logo" />
        <span className="app-name">Stargram</span>
      </div>
      <h2 className="title">Create New Account</h2>
      <p className="subtitle">
        To use Stargram enter your details
      </p>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="form-content"
      >
            {/* Name field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input type="text" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Username field */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input type="text" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Email field */}
              <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Password field */}
              <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
           
            {/* Button with loading feature */}
            <Button type="submit" className="shad-button_primary">
              {isCreatingAccount ? (
                <div className="flex-center gap-2">
                 <Loader /> Loading...
                </div>
              ): "Sign up"}
            </Button>
            
            <p className="text-small-regular text-light-2 text-center -mt-2">
              Already have and account?
              <Link to="/sign-in" className="text-primary-300 text-small-semibold ml-1">Sign in</Link>
            </p>

          </form>
        </div>
      </Form>
    </div>
  );
};

export default SignUpForm;
