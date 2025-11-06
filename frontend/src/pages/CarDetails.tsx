import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Edit } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const CarDetails = () => {
  // Mock data - would come from localStorage/API
  const carData = {
    vehicleType: "Car",
    brand: "Toyota",
    model: "Camry",
    color: "Silver",
    plateNumber: "ABC-1234",
    year: "2022",
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Vehicle Details</h2>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Details
          </Button>
        </div>

        <Card className="p-8">
          <div className="flex items-center gap-6 mb-8 pb-8 border-b">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Car className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">
                {carData.brand} {carData.model}
              </h3>
              <p className="text-muted-foreground">{carData.plateNumber}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Vehicle Type</p>
                <p className="text-lg font-medium">{carData.vehicleType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Brand</p>
                <p className="text-lg font-medium">{carData.brand}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Model</p>
                <p className="text-lg font-medium">{carData.model}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Color</p>
                <p className="text-lg font-medium">{carData.color}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Plate Number</p>
                <p className="text-lg font-medium">{carData.plateNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Year</p>
                <p className="text-lg font-medium">{carData.year}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Vehicle Usage Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-secondary/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">127</p>
              <p className="text-sm text-muted-foreground">Total Hours Parked</p>
            </div>
            <div className="text-center p-4 bg-secondary/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">84</p>
              <p className="text-sm text-muted-foreground">Total Trips</p>
            </div>
            <div className="text-center p-4 bg-secondary/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">$342</p>
              <p className="text-sm text-muted-foreground">Total Savings</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CarDetails;
