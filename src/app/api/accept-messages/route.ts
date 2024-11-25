import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/User";
import { User } from "next-auth"

export async function POST (req: Request){
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user:User = session?.user as User;
    if(!session || !session.user) {
        return Response.json(
            {
              success: false,
              message: 'Not authenticated',
            },
            { status: 401 }
        );
    }

    const userId = user._id;
    const { acceptMessage } = await req.json();
    try {
        const updateMessage = await UserModel.findOne({'_id': userId}, 
        {'isAcceptingMessage': acceptMessage},{ new: true});
        return Response.json(
            {
              success: true,
              message: 'Message updated successfully',
              updateMessage
            },
            { status: 200 }
        );
    } catch (error) {
        return Response.json(
            {
              success: false,
              message: 'Something went wrong',
            },
            { status: 400 }
        );
    }
}


export async function GET(request: Request) {
    // Connect to the database
    await dbConnect();
  
    // Get the user session
    const session = await getServerSession(authOptions);
    const user = session?.user;
  
    // Check if the user is authenticated
    if (!session || !user) {
      return Response.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
  
    try {
      // Retrieve the user from the database using the ID
      const foundUser = await UserModel.findById(user._id);
  
      if (!foundUser) {
        // User not found
        return Response.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }
  
      // Return the user's message acceptance status
      return Response.json(
        {
          success: true,
          isAcceptingMessage: foundUser.isAcceptingMessage,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error retrieving message acceptance status:', error);
      return Response.json(
        { success: false, message: 'Error retrieving message acceptance status' },
        { status: 500 }
      );
    }
  }