import { Typography } from "@mui/material";
import { useState } from "react";
import InfoDialog from "../../../components/InfoDialog";

export const ReadInfo = (
  <Typography>
    <p>
      Peers who have <u><b>read</b></u> permission will receive new wiki updates from other
      peers.
    </p>
    <p>
      <b>Important:</b> This permission is enforced through trust that all peers are
      running software that honors this setting.  There is no strong guarantee that this permission can be enforced.
    </p>
    <p>
        When someone's <u><b>read</b></u> permission is revoked, they will still be able to read any content that was
        sent to them by peers before revocation occured.
    </p>
  </Typography>
);

export const WriteInfo = (
  <Typography>
    <p>
      Peers who have <u><b>write</b></u> permission will be able to cryptographically verify that their wiki updates adhere to this setting.
    </p>
    <p>
      <b>Important:</b> If this permission is revoked but the revocation information hasn't made its way to all peers, it's possible that someone's additions
      could appear to be valid until the revocation notice is recieved.  In order to prevent this, please try and ensure that all peers are sharing updates regularly.
    </p>
  </Typography>
);
