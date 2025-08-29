import { Webhook } from "svix";
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from "next/server";
import {
    createUser,
    deleteUserByEmail,
    findAllUser,
    findUserByEmail,
    updateUserByEmail,
} from "@/lib/services/userService";

// const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;
// const svix = new Webhook(WEBHOOK_SECRET);


// export async function GET(req: NextRequest) {
//     const urlParam = req.nextUrl.searchParams.get('email');
//     var user_data;
//     if (urlParam) {
//         user_data = await findUserByEmail(decodeURIComponent(urlParam));
//         if (!user_data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
//     } else {
//         user_data = await findAllUser();
//         if (!user_data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
//     }

//     return NextResponse.json(user_data);
// }

// export async function POST(req: NextRequest) {
//     const data = await req.json();
//     const id = await createUser(data);
//     if (!id) {
//         return NextResponse.json(
//             { error: "Failed to create user" },
//             { status: 500 }
//         );
//     }
//     return NextResponse.json({ insertedId: id });
// }

// export async function PUT(req: NextRequest) {
//     const urlParam = req.nextUrl.searchParams.get('email');
//     if (!urlParam) return NextResponse.json({ error: 'Missing Email' }, { status: 400 });

//     const update = await req.json();
//     await updateUserByEmail(decodeURIComponent(urlParam), update);

//     return NextResponse.json({ success: true });
// }

// export async function DELETE(req: NextRequest) {
//     const urlParam = req.nextUrl.searchParams.get('email');
//     if (!urlParam) return NextResponse.json({ error: 'Missing Email' }, { status: 400 });

//     await deleteUserByEmail(decodeURIComponent(urlParam));
//     return NextResponse.json({ success: true });
// }

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;


export async function POST(req: Request) {
    const body = await req.text(); // Raw body required for svix signature verification
    const headerList = await headers();

    const svixHeaders = {
        'svix-id': await headerList.get('svix-id')!,
        'svix-timestamp': await headerList.get('svix-timestamp')!,
        'svix-signature': await headerList.get('svix-signature')!,
    };

    const wh = new Webhook(WEBHOOK_SECRET);

    let event: any;
    try {
        event = wh.verify(body, svixHeaders);
    } catch (err) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const { type, data } = event;

    if ((type === "user.created") || (type === "user.updated")) {
        const user = {
            clerkId: data.id,
            email: data.email_addresses?.[0]?.email_address || "",
            firstName: data.first_name,
            lastName: data.last_name,
            imageUrl: data.image_url,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
        if (type === "user.created") {
            const id = await createUser(data);
            if (!id) {
                return NextResponse.json(
                    { error: "Failed to create user" },
                    { status: 500 }
                );
            }
            return NextResponse.json({ success: true });
        }
        else if (type === "user.updated") {
            const result = await updateUserByEmail(data.email_address, data);
            if (!result) {
                return NextResponse.json(
                    { error: "Failed to update user" },
                    { status: 500 }
                );
            }
            return NextResponse.json({ success: true });
        }
    }

    if (type === "user.deleted") {
        await deleteUserByEmail(data.email);
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}
