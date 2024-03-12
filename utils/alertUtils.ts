import { Alert } from "@/generated/proto/transiter/public";
import { AlertProps } from "@/components/Alert";
import { getHumanReadableActivePeriodFromAlert } from "./transiterUtils";
import { Notice } from "@/utils/serviceStatus";

export function getMtaAlertPropsFromRouteAlerts(alerts: Alert[]): AlertProps[] {
  const allAlertProps = alerts
    ?.map((alert) => {
      const enHtmlHeader = alert?.header?.find(
        (header) => header.language.toLowerCase() === "en-html",
      );
      const enHtmlDescription = alert?.description?.find(
        (header) => header.language.toLowerCase() === "en-html",
      );

      const enHeader = alert?.header?.find(
        (header) => header.language.toLowerCase() === "en",
      );
      const enDescription = alert?.description?.find(
        (header) => header.language.toLowerCase() === "en",
      );

      const baseAlertProps = {
        id: alert?.id,
        isMtaAlert: true,
        humanReadableActivePeriod: getHumanReadableActivePeriodFromAlert(alert),
        startsAt:
          alert?.currentActivePeriod?.startsAt !== undefined
            ? parseInt(
                alert?.currentActivePeriod?.startsAt as unknown as string,
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
      allAlertProps.findIndex(({ id: otherId }) => otherId === id) === idx,
  );
}

export function getAlertPropsFromSystemNotices(
  notices: Notice[],
): AlertProps[] {
  return notices.map((notice) => {
    return {
      header: notice.title,
      description: notice.message,
      startsAt: notice.timestamp,
    };
  });
}
