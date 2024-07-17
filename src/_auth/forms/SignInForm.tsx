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
import { SigninValidation } from "../../lib/validation";
import { z } from "zod";

import { useToast } from "../../components/ui/use-toast";
import { useSignInAccount } from "../../lib/react-query/queriesAndMutations";
import { useUserContext } from "../../context/AuthContext";


const SignInForm = () => {

  const { toast } = useToast();
  const { checkAuthUser } = useUserContext();
  const navigate = useNavigate();
  const { mutateAsync: signInAccount } = useSignInAccount();

  // Define form
  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  

  // Submit handler
  async function onSubmit(values: z.infer<typeof SigninValidation>) {
    const session = await signInAccount({
      email: values.email,
      password: values.password,
    })
    console.log('here')
    if (!session) {
      return toast ({title: 'Test1.'})
      // Sign in failed. Please try again
    }
    const isLoggedIn = await checkAuthUser();

    if(isLoggedIn) {
      form.reset();

      navigate('/')
    } else {
      return toast({title: 'Test2.'})
    }
  }

  return (
    // Sign-in form
    <div className="container">
      <Form {...form}>
        <div className="form-wrapper">
          <div className="logo-wrapper">
          <img src="/assets/images/star-logo.png" alt="logo" className="logo" />
        <span className="app-name">Stargram</span>
      </div>
          <h2 className="title">Log into your account</h2>
          <p className="subtitle">
            Welcome back! Please enter your details.
          </p>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="form-content"
          >
            
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
              
                <div className="flex-center gap-2">
                 Sign in
                </div>
              
            </Button>
            
            <p className="text-small-regular text-light-2 text-center -mt-2">
              Don't have an account?
              <Link to="/sign-up" className="text-primary-300 text-small-semibold ml-1">Sign up</Link>
            </p>

          </form>
        </div>
      </Form>
    </div>
  );
};

export default SignInForm;
