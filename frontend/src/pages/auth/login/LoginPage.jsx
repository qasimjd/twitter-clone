import { useState } from "react";
import { Link } from "react-router-dom";

import XSvg from "../../../components/svgs/X";

import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "../../../components/common/LoadingSpinner";


const LoginPage = () => {
	const [formData, setFormData] = useState({
		emailOrUsername: "",
		password: "",
	});
	
	const queryClient = useQueryClient();

	const { mutate, isPending, isError, error } = useMutation({
		mutationFn: async (formData) => {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Something went wrong");
			}

			const data = await response.json();
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
		},
	});


	const handleSubmit = (e) => {
		e.preventDefault();
		mutate(formData);
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};


	return (
		<div className='max-w-screen-xl mx-auto flex h-screen'>
			<div className='flex-1 hidden lg:flex items-center  justify-center'>
				<XSvg className='lg:w-2/3 fill-white' />
			</div>
			<div className='flex-1 flex flex-col justify-center items-center'>
				<form className='flex gap-4 flex-col' onSubmit={handleSubmit}>
					<XSvg className='w-24 lg:hidden fill-white' />
					<h1 className='text-4xl font-extrabold text-white'>{"Let's"} go.</h1>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdOutlineMail />
						<input
							type='text'
							className='grow'
							placeholder='email or Username'
							name='emailOrUsername'
							onChange={handleInputChange}
							value={formData.emailOrUsername}
						/>
					</label>

					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdPassword />
						<input
							type='password'
							className='grow'
							placeholder='Password'
							name='password'
							onChange={handleInputChange}
							value={formData.password}
						/>
					</label>
					<button className='btn rounded-full btn-primary text-white'>Login</button>
					{isError && <p className='text-red-500'>{error.message} </p>}
				</form>
				<div className='flex flex-col gap-2 mt-4'>
					<p className='text-white text-sm'>{"Don't"} have an account?</p>
					<Link to='/signup'>
						<button className='btn rounded-full btn-primary text-white btn-outline w-full'>
							{isPending ? <LoadingSpinner size="sm"/> : "Sign up"}
						</button>
					</Link>
				</div>
			</div>
		</div>
	);
};
export default LoginPage;