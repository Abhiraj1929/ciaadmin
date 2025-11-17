import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(){
  try{
    const { data,error } = await supabase
    .from('stalls')
    .select('*')
    .order('created_at', {ascending: false})

    if(error){
      return NextResponse.json(
        {error: error.message},
        {status: 400}
      )
    }
    return NextResponse.json(
      {data, count:data.length},
      {status: 200}
    )

  }
  catch{
    return NextResponse.json(
      {error: 'Internal server error'},
      {status: 500}
    )
  }
}