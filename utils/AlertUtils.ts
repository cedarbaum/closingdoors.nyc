import { Alert } from "@/generated/proto/transiter/public";
import { MtaAlertProps } from "@/components/MtaAlert";
import { getHumanReadableActivePeriodFromAlert } from "./TransiterUtils";

export function getMtaAlertPropsFromRouteAlerts(
  alerts: Alert[]
): MtaAlertProps[] {
  const allAlertProps = alerts
    ?.map((alert) => {
      const enHtmlHeader = alert?.header?.find(
        (header) => header.language.toLowerCase() === "en-html"
      );
      const enHtmlDescription = alert?.description?.find(
        (header) => header.language.toLowerCase() === "en-html"
      );

      const enHeader = alert?.header?.find(
        (header) => header.language.toLowerCase() === "en"
      );
      const enDescription = alert?.description?.find(
        (header) => header.language.toLowerCase() === "en"
      );

      const baseAlertProps = {
        id: alert?.id,
        humanReadableActivePeriod: getHumanReadableActivePeriodFromAlert(alert),
        startsAt:
          alert?.currentActivePeriod?.startsAt !== undefined
            ? parseInt(
                alert?.currentActivePeriod?.startsAt as unknown as string
              )
            : undefined,
        endsAt:
          alert?.currentActivePeriod?.endsAt !== undefined
            ? parseInt(alert?.currentActivePeriod?.endsAt as unknown as string)
            : undefined,
      };

      return enHtmlHeader !== undefined
        ? {
            ...baseAlertProps,
            header: enHtmlHeader?.text,
            description: enHtmlDescription?.text,
          }
        : {
            ...baseAlertProps,
            header: enHeader?.text,
            description: enDescription?.text,
          };
    })
    ?.filter(({ header }) => header !== undefined);

  // Deduplicate
  return allAlertProps.filter(
    ({ id }, idx) =>
      allAlertProps.findIndex(({ id: otherId }) => otherId === id) === idx
  );
}
