import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, CreditCard, Package, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AceledaBankLogo, ABaBankLogo } from "./BankLogos";

export function PurchaseFlowHelper() {
  return (
    <Card className="bg-gradient-to-r from-metallic-50 to-metallic-100 border-metallic-200 mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-metallic-900 mb-2">
              How to Purchase from ShopSync
            </h3>
            <p className="text-metallic-600 text-sm mb-4">
              Quick and secure shopping in 3 easy steps
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Step 1 */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-metallic-700 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                1
              </div>
              <div className="text-center">
                <ShoppingCart className="w-5 h-5 text-metallic-700 mx-auto mb-1" />
                <p className="text-xs text-metallic-600">Add to Cart</p>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-metallic-400" />

            {/* Step 2 */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-metallic-700 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                2
              </div>
              <div className="text-center">
                <CreditCard className="w-5 h-5 text-metallic-700 mx-auto mb-1" />
                <p className="text-xs text-metallic-600">Checkout</p>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-metallic-400" />

            {/* Step 3 */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-metallic-700 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                3
              </div>
              <div className="text-center">
                <Package className="w-5 h-5 text-metallic-700 mx-auto mb-1" />
                <p className="text-xs text-metallic-600">Receive</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/cart">
                <ShoppingCart className="w-4 h-4 mr-1" />
                View Cart
              </Link>
            </Button>
            <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <span className="text-green-800 text-xs font-medium">
                Supported:
              </span>
              <AceledaBankLogo className="w-8 h-4" />
              <ABaBankLogo className="w-8 h-4" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
