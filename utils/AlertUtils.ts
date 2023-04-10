import { Alert } from "@/generated/gql/graphql";
import { MtaAlertProps } from "@/components/MtaAlert";

export function getMtaAlertPropsFromRouteAlerts(alerts: Alert[]): MtaAlertProps[] {
  const allAlertProps = alerts
    ?.map((alert) => {
      const enHtmlHeader = alert?.messages?.headers?.find(
        (header) => header.language === "en-html"
      );
      const enHtmlDescription = alert?.messages?.descriptions?.find(
        (header) => header.language === "en-html"
      );

      const enHeader = alert?.messages?.headers?.find(
        (header) => header.language === "en"
      );
      const enDescription = alert?.messages?.descriptions?.find(
        (header) => header.language === "en"
      );

      return enHtmlHeader !== undefined
        ? { header: enHtmlHeader?.text, description: enHtmlDescription?.text }
        : { header: enHeader?.text, description: enDescription?.text };
    })
    ?.filter(({ header }) => header !== undefined);

  // Deduplicate
  return allAlertProps.filter(
    ({ header, description }, idx) =>
      allAlertProps.findIndex(
        ({ header: h, description: d }) => h === header && d === description
      ) === idx
  );
}
