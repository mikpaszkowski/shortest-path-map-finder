import {
    Card,
    CardContent,
    Container,
    Typography,
  } from "@mui/material";
import { RoutePreference } from "../types";


export interface ResultContainerProps {
    resultShortestPathMode: RoutePreference;
    cost: number
}

export const ResultContainer = ({ resultShortestPathMode, cost }: ResultContainerProps) => {

  return (
    <Card
      sx={{
        position: "absolute",
        minWidth: "150px",
        top: 10,
        right: 10,
        zIndex: 1,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        display: "flex",
        padding: 1,
        justifyContent: "center",
      }}
    >
      <CardContent className="result-card-content">
        <Container sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Typography
            sx={{ color: "text.secondary", mb: 1.5, textAlign: "center" }}
            variant="h5"
          >
            Result
          </Typography>
        </Container>
        <Typography
          sx={{
            color: "text.secondary",
            fontWeight: "bold",
            fontSize: 20,
            mt: 2,
            textAlign: "center",
          }}
        >
          {resultShortestPathMode === RoutePreference.DISTANCE
            ? Math.round(cost) + " m"
            : Math.round(cost) + " s"}
        </Typography>
      </CardContent>
    </Card>
  );
};
