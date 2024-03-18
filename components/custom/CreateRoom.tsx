"use client";
import React, { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "../ui/button";
import { MdAddCircleOutline } from "react-icons/md";
type Props = {
  userInfo: User;
};
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { User } from "lucia";

function CreateRoom({ userInfo }: Props) {
  const [roomName, setRoomName] = useState<String>("");

  const CreateNewRoom = async () => {
    const roomId = uuidv4();
    const res = await fetch("/api/room/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: roomId,
        defaultAccesses: ["room:write"],
        name: roomName,
        content: "",
        owner: userInfo.username,
        users: "",
      }),
    })
      .then((res) => res.json())
      .then((data) => console.log(data));
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="w-full gap-1">
          <MdAddCircleOutline className="w-4 h-4" /> New Note
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Enter Details</AlertDialogTitle>
          <AlertDialogDescription>
            <Label>Name</Label>
            <Input
              onChange={(e) => setRoomName(e.target.value)}
              className="p-4 py-6 rounded-lg"
              placeholder="Daily Journal"
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={CreateNewRoom}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>{" "}
    </AlertDialog>
  );
}

export default CreateRoom;
