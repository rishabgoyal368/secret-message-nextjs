import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";

const usernameQuerySchema = z.object({
    username: usernameValidation
});

export async function GET (request: Request ) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const queryParams = {
            username: searchParams.get('username'),
        }
        const result = usernameQuerySchema.safeParse(queryParams);
        if(!result.success){
            const usernameErrors = result.error.format().username?._errors || []; 
            return Response.json({
                success: false,
                message: usernameErrors ?.length > 0 ? usernameErrors.join(',') : 'username validation failed'
            }, {
                status: 400,
            })
        }

        const { username } = result.data;
        
        const existUser = await UserModel.findOne({
            username:username, isVerified:true
        });
        
        if(existUser){
            return Response.json({
                success: false,
                message: 'username is already taken'
            }, {
                status: 400,
            }) 
        }
        return Response.json({
            success: true,
            message:'username is unique'
        }, {
            status: 200,
        })
    } catch (error) {
        console.log('error: ' , error);
        return Response.json({
            success: false,
            message:'Error checking username'
        }, {
            status: 500,
        })
    }
}