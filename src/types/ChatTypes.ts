export type Message = {
    id: string;
    author: Participant;
    type: string;
    timestamp: number;
    liked: boolean;
    data: { text?: string; emoji?: string };
    room: string;
};

export type Participant = { id: string, name: string }