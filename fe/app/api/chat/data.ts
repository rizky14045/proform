const previousDay = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);


import avatar1 from "@/public/images/avatar/avatar-7.jpg";
import avatar2 from "@/public/images/avatar/avatar-2.jpg";
import avatar3 from "@/public/images/avatar/avatar-3.jpg";
import avatar4 from "@/public/images/avatar/avatar-4.jpg";
import avatar5 from "@/public/images/avatar/avatar-5.jpg";
import avatar6 from "@/public/images/avatar/avatar-6.jpg";
import avatar7 from "@/public/images/avatar/avatar-7.jpg";
import avatar8 from "@/public/images/avatar/avatar-8.jpg";
import avatar9 from "@/public/images/avatar/avatar-9.jpg";
import avatar10 from "@/public/images/avatar/avatar-10.jpg";
import avatar11 from "@/public/images/avatar/avatar-11.jpg";
export const profileUser = {
  id: 11,
  avatar: avatar1,
  fullName: "Mr. Bean",
  bio: "UX/UI Designer",
  role: "admin",
  about:
    "Dessert chocolate cake lemon drops jujubes. Biscuit cupcake ice cream bear claw brownie brownie marshmallow.",
  status: "online",
  settings: {
    isTwoStepAuthVerificationEnabled: true,
    isNotificationsOn: false,
  },
  date: "10 am",
};

export const contacts = [
  {
    id: 1,
    fullName: "Felecia Rower",
    role: "Frontend Developer",
    about:
      "Cake pie jelly jelly beans. Marzipan lemon drops halvah cake. Pudding cookie lemon drops icing",
    avatar: avatar2,
    status: "online",
    unreadmessage: 0,
    date: "10 am",
  },
  {
    id: 2,
    fullName: "Adalberto Granzin",
    role: "UI/UX Designer",
    about:
      "Toffee caramels jelly-o tart gummi bears cake I love ice cream lollipop. Sweet liquorice croissant candy danish dessert icing. Cake macaroon gingerbread toffee sweet.",
    avatar: avatar3,
    status: "online",
    unreadmessage: 1,
    date: "10 am",
  },
  {
    id: 3,
    fullName: "Joaquina Weisenborn",
    role: "Town planner",
    about:
      "Soufflé soufflé caramels sweet roll. Jelly lollipop sesame snaps bear claw jelly beans sugar plum sugar plum.",
    avatar: avatar4,
    status: "busy",
    unreadmessage: 1,
    date: "10 am",
  },
  {
    id: 4,
    fullName: "Verla Morgano",
    role: "Data scientist",
    about:
      "Chupa chups candy canes chocolate bar marshmallow liquorice muffin. Lemon drops oat cake tart liquorice tart cookie. Jelly-o cookie tootsie roll halvah.",
    avatar: avatar5,
    status: "online",
    unreadmessage: 2,
    date: "10 am",
  },
  {
    id: 5,
    fullName: "Margot Henschke",
    role: "Dietitian",
    about:
      "Cake pie jelly jelly beans. Marzipan lemon drops halvah cake. Pudding cookie lemon drops icing",
    avatar: avatar6,
    status: "busy",
    unreadmessage: 0,
    date: "10 am",
  },
  {
    id: 6,
    fullName: "Sal Piggee",
    role: "Marketing executive",
    about:
      "Toffee caramels jelly-o tart gummi bears cake I love ice cream lollipop. Sweet liquorice croissant candy danish dessert icing. Cake macaroon gingerbread toffee sweet.",
    avatar: avatar7,
    status: "online",
    unreadmessage: 2,
    date: "10 am",
  },
  {
    id: 7,
    fullName: "Miguel Guelff",
    role: "Special educational needs teacher",
    about:
      "Biscuit powder oat cake donut brownie ice cream I love soufflé. I love tootsie roll I love powder tootsie roll.",
    avatar: avatar8,
    status: "online",
    unreadmessage: 0,
    date: "10 am",
  },
  {
    id: 8,
    fullName: "Mauro Elenbaas",
    role: "Advertising copywriter",
    about:
      "Bear claw ice cream lollipop gingerbread carrot cake. Brownie gummi bears chocolate muffin croissant jelly I love marzipan wafer.",
    avatar: avatar9,
    status: "away",
    unreadmessage: 0,
    date: "10 am",
  },
  {
    id: 9,
    fullName: "Bridgett Omohundro",
    role: "Designer, television/film set",
    about:
      "Gummies gummi bears I love candy icing apple pie I love marzipan bear claw. I love tart biscuit I love candy canes pudding chupa chups liquorice croissant.",
    avatar: avatar10,
    status: "offline",
    unreadmessage: 0,
    date: "10 am",
  },
  {
    id: 10,
    fullName: "Zenia Jacobs",
    role: "Building surveyor",
    about:
      "Cake pie jelly jelly beans. Marzipan lemon drops halvah cake. Pudding cookie lemon drops icing",
    avatar: avatar11,
    status: "away",
    unreadmessage: 1,
    date: "10 am",
  },
];

export const chats = Array.from({ length: 10 }, (_, i) => {
  const id = i + 1;

  return {
    id,
    userId: id,
    unseenMsgs: id % 2,
    chat: [
      {
        message: "Hi",
        time: "Mon Dec 10 2018 07:45:00 GMT+0000 (GMT)",
        senderId: 11,
        replayMetadata: false,
      },
      {
        message: "Hello. How can I help you?",
        time: "Mon Dec 10 2018 07:45:15 GMT+0000 (GMT)",
        senderId: 2,
        replayMetadata: false,
      },
      {
        message: `I have a question regarding my account.`,
        time: "Mon Dec 10 2018 07:46:10 GMT+0000 (GMT)",
        senderId: 11,
        replayMetadata: false,
      },
      {
        message: "Sure, let me check that for you.",
        time: "Mon Dec 10 2018 07:46:30 GMT+0000 (GMT)",
        senderId: 2,
        replayMetadata: false,
      },
      {
        message: "I’ll update you shortly.",
        time: "Mon Dec 10 2018 07:47:00 GMT+0000 (GMT)",
        senderId: 2,
        replayMetadata: false,
      },
      {
        message: "Thanks, I’ll wait.",
        time: previousDay,
        senderId: 11,
        replayMetadata: false,
      },
    ],
  };
});
export type Chat = typeof chats[number];
export type Contact = typeof contacts[number];
export type ProfileUser = typeof profileUser;