import Link from "next/link";
import { FullScreenError } from "@/components/FullScreenError";

export default function Custom404() {
  return (
    <FullScreenError
      error={
        <div>
          Invalid page. Click{" "}
          <Link className="underline" href="/">
            here
          </Link>{" "}
          to go back home.
        </div>
      }
    />
  );
}
