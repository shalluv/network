import { cva } from "class-variance-authority";

const bubbleVariants = cva(
	"inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
	{
		variants: {
			variant: {
				sent: "bg-blue-600 text-white",
				received: "bg-muted text-muted-foreground",
			},
		},
		defaultVariants: {
			variant: "sent",
		},
	},
);

export { bubbleVariants };
